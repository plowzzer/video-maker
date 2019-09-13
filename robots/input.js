const readline = require ('readline-sync')
const state = require('./state')

function robot() {
  const content = {}
  
  content.searchTerm = askAndReturnSearchTerm()
  content.lang = askLanguageSearch()
  content.prefix = askAndReturnPrefix()
  content.maximumSentenses = askSentensesNumber()
  state.save(content)  

  function askAndReturnSearchTerm(){
    return readline.question('Type a Wikipedia search term: ')
  }

  function askLanguageSearch(){
    const langs = ['en', 'pt-br']
    const selectedLangIndex = readline.keyInSelect(langs, 'Choise one language: ')
    return langs[selectedLangIndex]
  }

  function askAndReturnPrefix(){
    const prefixes = ['Who is', 'What is', 'How to', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choise one prefix: ')
    return prefixes[selectedPrefixIndex]
  }

  function askSentensesNumber(){
    return readline.questionInt('How many sentenses do you whant to check? ')
  }

}

module.exports = robot