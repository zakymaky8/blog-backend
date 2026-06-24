
const generateSlugId = (title) => {

    const caseLowered = title.toLowerCase();
    const parsedWords = caseLowered.split(" ");

    const finalSlug = parsedWords.join("-");

    return finalSlug
}

module.exports = {
    generateSlugId
}