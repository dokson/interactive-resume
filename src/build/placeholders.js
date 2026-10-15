// Single source of truth for contact/social values injected as __PLACEHOLDER__ tokens
// across all source files (HTML, JSON-LD, llms.txt, robots.txt) at build time.
// Update package.json's config.contact / config.social — never a placeholder's target file.

function buildReplacements(packageJson, { dateModified } = {}) {
    const { contact, social, domain, consulting, education, images, location } = packageJson.config;

    const replacements = {
        __SITE_URL__: packageJson.homepage,
        __SITE_DOMAIN__: domain,
        __EMAIL__: contact.email,
        __PHONE__: contact.phone,
        __PHONE_TEL__: contact.phone.replace(/\s+/g, ''),
        __LINKEDIN__: social.linkedin,
        __GITHUB__: social.github,
        __TWITTER__: social.twitter,
        __TWITTER_HANDLE__: `@${new URL(social.twitter).pathname.slice(1)}`,
        __WIKIDATA__: social.wikidata,
        __RESEARCHGATE__: social.researchgate,
        __CONSULTING_NAME__: consulting.name,
        __CONSULTING_URL__: consulting.url,
        __EDUCATION_NAME__: education.name,
        __EDUCATION_URL__: education.url,
        __EDUCATION_WIKIDATA__: education.wikidata,
        __PROFILE_IMAGE__: images.profile,
        __PROFILE_IMAGE_URL__: `${packageJson.homepage}/${images.profile}`,
        __CITY__: location.city,
        __CITY_IT__: location.cityIt,
        __REGION__: location.region,
        __COUNTRY__: location.country,
        __COUNTRY_NAME__: location.countryName,
        __JOB_TITLE__: packageJson.job_title,
    };

    if (dateModified) {
        replacements.__DATE_MODIFIED__ = dateModified;
    }

    return replacements;
}

function applyReplacements(text, replacements) {
    return Object.entries(replacements).reduce(
        (acc, [placeholder, value]) => acc.replaceAll(placeholder, value),
        text
    );
}

module.exports = { buildReplacements, applyReplacements };
