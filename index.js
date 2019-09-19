const robots = { 
  state: require('./robots/state'),
  input: require('./robots/input'),
  text: require('./robots/text'),
  image: require('./robots/images'),
  video: require('./robots/video')
}

async function start() {
  robots.input()
  await robots.text()
  await robots.image()
  await robots.video()

  // const content = robots.state.load()
  // console.dir(content, { depth: null })
}

start()