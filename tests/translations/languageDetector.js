const translations = {
    en: require('./en/common.json'),
    et: require('./et/common.json')
};

export async function getTranslations(page) {
    const locale = await page.evaluate(() => {
        return localStorage.getItem('i18nextLng') || 'en';
    });
    return translations[locale];
}

