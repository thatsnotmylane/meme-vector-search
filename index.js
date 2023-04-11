import weaviate from 'weaviate-ts-client'
import * as fs from 'node:fs';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080'
})

const schemaResult = await client.schema.getter().do()

console.log(schemaResult)



const subreddit = 'memes';

// make a request to the Reddit API to get the most recent posts in the memes subreddit
fetch(`https://www.reddit.com/r/${subreddit}.json`)
  .then(response => response.json())
  .then(data => {
    // extract the URL of the first image from the response
    const imageUrl = data.data.children[0].data.url;

    console.log(imageUrl)
    // do something with the image URL, such as display it on the page
    //const image = document.createElement('img');
    //image.src = imageUrl;
    //document.body.appendChild(image);
  })
  .catch(error => console.error(error));



const test = Buffer.from(fs.readFileSync('./test.jpg') ).toString('base64');

const resImage = await client.graphql.get()
  .withClassName('Meme')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Write result to filesystem
const result = resImage.data.Get.Meme[0].image;
fs.writeFileSync('./result.jpg', result, 'base64');


async function loadMemes() {
    const memeDir = 'C:/Users/thats/Pictures/Emergency  Memes/'

    const memes = fs.readdirSync(memeDir)

    memes.forEach(async fileName => {
        const img = fs.readFileSync(`${memeDir}${fileName}`)
        const b64 = Buffer.from(img).toString('base64')

        await client.data.creator()
            .withClassName('Meme')
            .withProperties({
                image: b64,
                text: fileName
            })
            .do()
            
    })
}


async function  createSchema() {
    const schemaConfig = {
        'class': 'Meme',
        'vectorizer': 'img2vec-neural',
        'vectorIndexType': 'hnsw',
        'moduleConfig': {
            'img2vec-neural': {
                'imageFields': [
                    'image'
                ]
            }
        },
        'properties': [
            {
                'name': 'image',
                'dataType': ['blob']
            },
            {
                'name': 'text',
                'dataType': ['string']
            }
        ]
    }

    await client.schema
        .classCreator()
        .withClass(schemaConfig)
        .do();

}