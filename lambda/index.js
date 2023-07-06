const AWS = require('aws-sdk');
const sharp = require('sharp');

//AWS에서 자체 실행되므로 따로 인증 정보를 넣지 않아도 됨
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name; //버킷 이름
  const Key = decodeURIComponent(event.Records[0].s3.object.key); //파일명(한글 디코딩)
  const filename = Key.split('/')[Key.split('/').length - 1]; //확장자 제거
  const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase(); //확장자(소문자)
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; //jpg는 jpeg로 바꿔줘야 함

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    const resizedImage = await sharp(s3Object.Body)
      .resize(400, 400, { fit: 'inside' }) //400 * 400으로 바꾸면서 비율 유지
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.putObject({ Bucket, Key: `thumb/${filename}`, Body: resizedImage }).promise();
    return callback(null, `thumb/${filename}`); //에러, 성공 리턴
  } catch (e) {
    console.error(e);
    return callback(e);
  }
};
