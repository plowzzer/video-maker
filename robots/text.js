const algorithmia = require("algorithmia");
const algorithmiaApiKey = require("../credentials/algorithmia").algorithmiaKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require("../credentials/watson-nlu").apikey
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js')

const state = require('./state')

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

async function robot(){

  //Loading the content file
  const content = state.load();

  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  limitMaximumSentenses(content)
  await fetchKeywordsOfAllSentenses(content)

  state.save(content)



  async function fetchContentFromWikipedia(){

    const algorithmiaAuth = algorithmia(algorithmiaApiKey)
    const wikiAlgorithmia = algorithmiaAuth.algo("web/WikipediaParser/0.1.2?timeout=300")
    const wikipediaResonse = await wikiAlgorithmia.pipe({"articleName":content.searchTerm,"lang": content.lang})
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

  function limitMaximumSentenses(content){
    content.sentences = content.sentences.slice(0, content.maximumSentenses)
  }

  async function fetchKeywordsOfAllSentenses(content){
    for(const sentence of content.sentences){
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence){
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }
  
        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })
  
        resolve(keywords)
      })
    })
  }
}

module.exports = robot