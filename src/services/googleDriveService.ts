export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  isFolder: boolean;
}

export interface FolderStructureStatus {
  rootFolderId: string | null;
  manuscriptsFolderId: string | null;
  documentsFolderId: string | null;
  financeFolderId: string | null;
  sectionsFolderId: string | null;
  backupsFolderId: string | null;
  subSectionFolders: Record<string, string>;
  isConfigured: boolean;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export class GoogleDriveService {
  /**
   * Helper to make authenticated requests to Google Drive v3 API
   */
  private static async fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `خطأ في Google Drive (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // use default
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return null;
    }

    return await res.json();
  }

  /**
   * List files and folders inside a specific parent folder or root
   */
  static async listFiles(
    token: string,
    folderId?: string,
    queryText?: string
  ): Promise<DriveItem[]> {
    let q = 'trashed = false';

    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

    if (queryText && queryText.trim()) {
      const sanitized = queryText.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }

    const fields =
      'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, createdTime, modifiedTime, parents)';
    const orderBy = 'folder, name';

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(
      orderBy
    )}&pageSize=100`;

    const data = await this.fetchWithAuth(url, token);
    const files = data.files || [];

    return files.map((f: any) => ({
      ...f,
      isFolder: f.mimeType === FOLDER_MIME,
    }));
  }

  /**
   * Find an existing folder by name and parent
   */
  static async findFolder(
    token: string,
    name: string,
    parentId?: string
  ): Promise<DriveItem | null> {
    let q = `mimeType = '${FOLDER_MIME}' and name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id, name, mimeType, webViewLink)`;

    const data = await this.fetchWithAuth(url, token);
    if (data.files && data.files.length > 0) {
      return {
        ...data.files[0],
        isFolder: true,
      };
    }
    return null;
  }

  /**
   * Create a new folder
   */
  static async createFolder(
    token: string,
    name: string,
    parentId?: string
  ): Promise<DriveItem> {
    // Check if already exists first to avoid duplicates
    const existing = await this.findFolder(token, name, parentId);
    if (existing) {
      return existing;
    }

    const body: any = {
      name,
      mimeType: FOLDER_MIME,
    };

    if (parentId) {
      body.parents = [parentId];
    }

    const data = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return {
      ...data,
      isFolder: true,
    };
  }

  /**
   * Upload a raw file (PDF, Word, Image, JSON) to Google Drive using multipart upload
   */
  static async uploadFile(
    token: string,
    file: File | Blob,
    filename: string,
    parentId?: string,
    mimeType?: string
  ): Promise<DriveItem> {
    const finalMime = mimeType || (file as File).type || 'application/octet-stream';
    const metadata: any = {
      name: filename,
      mimeType: finalMime,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileBuffer = await file.arrayBuffer();
    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n`;
    const fileHeaderPart = `${delimiter}Content-Type: ${finalMime}\r\n\r\n`;

    const blob = new Blob(
      [
        metadataPart,
        fileHeaderPart,
        new Uint8Array(fileBuffer),
        closeDelimiter,
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,createdTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: blob,
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`فشل رفع الملف إلى Google Drive: ${err}`);
    }

    const data = await res.json();
    return {
      ...data,
      isFolder: false,
    };
  }

  /**
   * Upload text or JSON directly (useful for backup files or metadata reports)
   */
  static async uploadTextContent(
    token: string,
    filename: string,
    content: string,
    parentId?: string,
    mimeType: string = 'application/json'
  ): Promise<DriveItem> {
    const blob = new Blob([content], { type: mimeType });
    return this.uploadFile(token, blob, filename, parentId, mimeType);
  }

  /**
   * Delete a file or folder from Google Drive
   * (Caller MUST obtain explicit user confirmation before executing)
   */
  static async deleteFile(token: string, fileId: string): Promise<boolean> {
    await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}`, token, {
      method: 'DELETE',
    });
    return true;
  }

  /**
   * Automatically bootstrap the AASJ scholarly folder hierarchy in Google Drive
   */
  static async setupJournalFolderStructure(
    token: string,
    onProgress?: (step: string) => void
  ): Promise<FolderStructureStatus> {
    const report = (msg: string) => {
      if (onProgress) onProgress(msg);
    };

    report('إنشاء وتأكيد المجلد الرئيسي للمجلة...');
    // 1. Root folder
    const root = await this.createFolder(
      token,
      'AASJ - مجلة أرشيف العلوم الزراعية (جامعة الأزهر)'
    );

    // 2. Main functional subfolders
    report('إنشاء مجلد المخطوطات والأبحاث...');
    const manuscriptsFolder = await this.createFolder(
      token,
      '1. المخطوطات والأبحاث (Manuscripts)',
      root.id
    );

    report('إنشاء مجلد الوثائق والأرشيف الرسمي...');
    const documentsFolder = await this.createFolder(
      token,
      '2. الوثائق والأرشيف الرسمي (Documents & Letters)',
      root.id
    );

    report('إنشاء مجلد الشؤون المالية وسندات القبض...');
    const financeFolder = await this.createFolder(
      token,
      '3. الشؤون المالية وإيصالات الرسوم (Finance & Vouchers)',
      root.id
    );

    report('إنشاء مجلد أجزاء وتخصصات المجلة السبعة...');
    const sectionsFolder = await this.createFolder(
      token,
      '4. أجزاء وتخصصات المجلة السبعة (7 Sections)',
      root.id
    );

    report('إنشاء مجلد النسخ الاحتياطية وقاعدة البيانات...');
    const backupsFolder = await this.createFolder(
      token,
      '5. النسخ الاحتياطية للنظام (System Backups)',
      root.id
    );

    // 3. Create subfolders for the 7 academic sections inside Sections folder
    const sectionNames = [
      'الجزء 1 - الاقتصاد الزراعي وعلم الاجتماع والإرشاد',
      'الجزء 2 - الإنتاج النباتي والمحاصيل والبساتين',
      'الجزء 3 - أمراض النبات ووقاية المزروعات',
      'الجزء 4 - الإنتاج الحيواني والداجني والأسماك',
      'الجزء 5 - علوم وتكنولوجيا الألبان والأغذية',
      'الجزء 6 - علوم الأراضي والمياه والهندسة الزراعية',
      'الجزء 7 - الكيمياء والميكروبيولوجيا الزراعية والوراثة',
    ];

    const subSectionFolders: Record<string, string> = {};
    for (const sName of sectionNames) {
      report(`تهيئة ${sName}...`);
      const secSub = await this.createFolder(token, sName, sectionsFolder.id);
      subSectionFolders[sName] = secSub.id;
    }

    report('اكتمل تجهيز الهيكل التنظيمي لمجلدات Google Drive بنجاح!');

    return {
      rootFolderId: root.id,
      manuscriptsFolderId: manuscriptsFolder.id,
      documentsFolderId: documentsFolder.id,
      financeFolderId: financeFolder.id,
      sectionsFolderId: sectionsFolder.id,
      backupsFolderId: backupsFolder.id,
      subSectionFolders,
      isConfigured: true,
    };
  }
}
