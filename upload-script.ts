// scripts/upload.ts
import { put } from '@vercel/blob';
import fs from 'fs';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

// 定義要上傳的檔案清單
// localPath: 你電腦裡的檔案路徑
// blobPath:  上傳到 Vercel Blob 後的檔名/路徑
const filesToUpload = [
  { localPath: './public/activities-data.json', blobPath: 'activities-data.json' },
  { localPath: './public/card-data.json', blobPath: 'card-data.json' },
];

async function uploadMultipleFiles() {
  // 檢查是否有 Token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('找不到 BLOB_READ_WRITE_TOKEN，請確認 .env 檔案存在');
  }

  console.log(`🚀 準備上傳 ${filesToUpload.length} 個檔案...`);
  try {
    // 3. 使用 Promise.all 同時啟動所有上傳任務
    const uploadPromises = filesToUpload.map(async (file) => {
      
      // 讀取檔案內容
      const fileBuffer = fs.readFileSync(file.localPath);

      // 執行上傳
      const blob = await put(file.blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false, // 保持檔名固定
        allowOverwrite: true, // 允許覆蓋同名檔案
      });

      console.log(`✅ 上傳完成: ${file.blobPath}`);
      return blob;
    });

    // 等待所有檔案都上傳完成
    const results = await Promise.all(uploadPromises);

    console.log('\n🎉 所有檔案上傳完畢！');
    
    // 顯示結果網址
    results.forEach((blob) => {
      console.log(`🔗 ${blob.pathname}: ${blob.url}`);
    });

  } catch (error) {
    console.error('❌ 上傳過程中發生錯誤:', error);
  }
}

uploadMultipleFiles();