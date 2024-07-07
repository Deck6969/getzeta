import { BadRequestException, Injectable } from '@nestjs/common';
const jimp = require('jimp');

import * as fs from 'fs';

@Injectable()
export class MediaUploadService {
  async compressImageTo300(file) {
    const img = await jimp.read(file['path']);

    const height = img.bitmap.height;
    const width = img.bitmap.width;

    if ((height < 200 && width < 300) || file.size <= 300 * 1000) {
      return '';
    }
    const heightRatio = height / width;
    const widthRatio = width / height;

    file['path'] = file['path'].replace('compressed', `300`);
    img.resize(300 * widthRatio, jimp.AUTO).write(file['path']);
  }

  async compressFolder(folderName) {
    try {
      const basePath = 'mediaFiles/metasuite/' + folderName;

      const files = fs.readdirSync(basePath);



      for await (let fileItem of files) {
        const allowTypes = ['.jpg', '.jpeg', '.png'];
        let type = '';
        const nameSplit = fileItem.split('.');
        if (nameSplit.length > 1) {
          type = nameSplit[1];
        }

        let filePath = basePath + '/' + fileItem;

        if (type && allowTypes.includes(`.${type}`)) {
          const img = await jimp.read(filePath);

          const height = img.bitmap.height;
          const width = img.bitmap.width;

          // await this.compressImageTo300(filePath);

          const heightRatio = height / width;
          const widthRatio = width / height;

          // console.log({ height });
          // console.log({ width });
          // console.log({ heightRatio });
          // console.log({ widthRatio });

          filePath = filePath.replace(
            fileItem,
            `compressed/${fileItem}`,
          );

          await img.resize(500 * widthRatio, jimp.AUTO).write(filePath);

        }
      }
    }
    catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }
}
