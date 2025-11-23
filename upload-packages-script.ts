import { put } from '@vercel/blob';
import { packagesData } from './src/app/packages-data';

async function uploadPackagesToBlob() {
  try {
    // 將 TypeScript 資料轉換為 JSON 字串
    const jsonData = JSON.stringify(packagesData, null, 2);
    
    // 上傳到 Vercel Blob
    const blob = await put('packages-data.json', jsonData, {
      access: 'public',
      contentType: 'application/json',
    });
    
    console.log('✅ 上傳成功！');
    console.log('檔案 URL:', blob.url);
    
    return blob;
  } catch (error) {
    console.error('❌ 上傳失敗:', error);
    throw error;
  }
}

// 執行上傳
uploadPackagesToBlob()
  .then(() => {
    console.log('🎉 腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 腳本執行失敗:', error);
    process.exit(1);
  });