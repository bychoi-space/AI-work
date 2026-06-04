const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://img.lfmall.co.kr/file/WAS/apps/2023/mfront/customer/icon_customer_my_btn.png';
const dest = path.join(__dirname, 'icon_customer_my_btn.png');

const file = fs.createWriteStream(dest);

https.get(url, function(response) {
    if (response.statusCode !== 200) {
        console.error('Failed to download image, status code: ' + response.statusCode);
        return;
    }
    response.pipe(file);
    file.on('finish', function() {
        file.close();
        console.log('Download completed successfully.');
    });
}).on('error', function(err) {
    fs.unlink(dest, () => {});
    console.error('Error downloading image: ' + err.message);
});
