const Jimp = require('jimp');
Jimp.read('assets/H_NC_BnW1.png').then(img => {
    // crop top-left cell 64x64
    let img1 = img.clone().crop(0, 0, 64, 64);
    img1.write('crop_0_0.png');
    
    // print 64x64 ascii for the whole thing or a cell
    let w = 64; let h = 64;
    let out = '';
    for(let y=0; y<h; y+=2) { // step 2 in y for better aspect ratio in text
        for(let x=0; x<w; x++) {
            let color = img1.getPixelColor(x, y);
            let rgba = Jimp.intToRGBA(color);
            if(rgba.a < 128) out += ' ';
            else out += '#';
        }
        out += '\n';
    }
    console.log(out);
});
