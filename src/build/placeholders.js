// Single source of truth for contact/social values injected as __PLACEHOLDER__ tokens
// across all source files (HTML, JSON-LD, llms.txt, robots.txt) at build time.
// Update package.json's config.contact / config.social — never a placeholder's target file.

function obfuscateDomainDisplay(url) {
    const stripped = url.replace(/^https?:\/\/(www\.)?/, '');
    return stripped
        .split(/([./])/)
        .map(part => (part === '.' || part === '/') ? `<span class=symbol>${part}</span>` : part)
        .join('');
}

function buildReplacements(packageJson, { buildDate } = {}) {
    const { contact, social, domain, employer, consulting, education, images, location } = packageJson.config;
    const [emailUser, emailDomain] = contact.email.split('@');

    const replacements = {
        __SITE_URL__: packageJson.homepage,
        __SITE_DOMAIN__: domain,
        __EMAIL__: contact.email,
        __EMAIL_OBFUSCATED__: `${emailUser}<span class=symbol>@</span>${emailDomain.replace('.', '<span class=symbol>.</span>')}`,
        __PHONE__: contact.phone,
        __PHONE_TEL__: contact.phone.replace(/\s+/g, ''),
        __PHONE_OBFUSCATED__: contact.phone.replace(/^\+/, '<span class=symbol>+</span>'),
        __LINKEDIN__: social.linkedin,
        __LINKEDIN_DISPLAY__: obfuscateDomainDisplay(social.linkedin),
        __GITHUB__: social.github,
        __GITHUB_DISPLAY__: obfuscateDomainDisplay(social.github),
        __TWITTER__: social.twitter,
        __TWITTER_HANDLE__: `@${new URL(social.twitter).pathname.slice(1)}`,
        __WIKIDATA__: social.wikidata,
        __EMPLOYER_NAME__: employer.name,
        __EMPLOYER_URL__: employer.url,
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

    if (buildDate) {
        replacements.__BUILD_DATE__ = buildDate;
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
