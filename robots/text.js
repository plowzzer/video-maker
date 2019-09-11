const algorithmia = require("algorithmia");
const credentials = require("../credentials/credentials").algorithmiaKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){

  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)



  async function fetchContentFromWikipedia(){

    const algorithmiaAuth = algorithmia(credentials)
    const wikiAlgorithmia = algorithmiaAuth.algo("web/WikipediaParser/0.1.2?timeout=300")
    const wikipediaResonse = await wikiAlgorithmia.pipe(content.searchTerm)
    const wikipediaContent = wikipediaResonse.get()
    
    content.sourceContentOriginal = wikipediaContent.content
      
  }

  function sanitizeContent(content){
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
    
    //Saving on content
    content.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text){
      const allLines = text.split('\n')
      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if(line.trim().length === 0 || line.trim().startsWith('=')){
          return false
        }
        return true
      })
      return withoutBlankLinesAndMarkdown.join(' ')
    }

    function removeDatesInParentheses(text){
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
  }
  
  function breakContentIntoSentences(content){
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }
}

module.exports = robot