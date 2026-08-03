const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
    // Folderul locales
    const localeDir = path.join(context.appOutDir, 'locales');

    // Limbile pe care vrei să le păstrezi
    const allowedLocales = ['en-US.pak', 'ro.pak'];

    if (fs.existsSync(localeDir)) {
        const files = fs.readdirSync(localeDir);

        files.forEach(file => {
            if (!allowedLocales.includes(file)) {
                fs.unlinkSync(path.join(localeDir, file));
            }
        });

        console.log('  \x1b[33m•\x1b[0m Limbi eliminate cu succes!');
    }

    // Șterge LICENSE.txt din win-unpacked
    const licenseFile = path.join(context.appOutDir, 'LICENSE.electron.txt');

    if (fs.existsSync(licenseFile)) {
        fs.unlinkSync(licenseFile);
        console.log('  \x1b[33m•\x1b[0m LICENSE.electron.txt eliminat!');
    }

    const licenseFilehtml = path.join(context.appOutDir, 'LICENSES.chromium.html');

    if (fs.existsSync(licenseFilehtml)) {
        fs.unlinkSync(licenseFilehtml);
        console.log('  \x1b[33m•\x1b[0m LICENSES.chromium.html eliminat!');
    }
};