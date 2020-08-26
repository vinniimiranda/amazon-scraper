import axios from 'axios'
import cheerio from 'cheerio'
import express from 'express'
import cors from 'cors'


const app = express()
app.use(cors())
const PORT = process.env.PORT || 3535

async function scrapeAmazon(search: string) {

    type ResultItem = {
        title: string;
        price: string;
    }
    const body = await axios.get(`https://www.amazon.com.br/s?k=${search}&dc&__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=a9_sc_1`)
    const dom = cheerio.load(body.data) 
    
    const results: ResultItem[] = dom('.s-result-list.s-search-results.sg-row').find('.s-result-item').toArray().map((el) => {
        const item = dom(el)
        const title = item.find('.a-size-base-plus.a-color-base.a-text-normal').text().trim()
        const price = item.find('.a-price-whole').text().trim()+item.find('.a-price-fraction').text().trim()
       
        return { title, price}
        
    }) 
    
    return results
    
}

app.get('/search', async(req, res) => {
    const {query} = req.query

    if (query) {
        const resulsts = await scrapeAmazon(query as string)
        return res.status(200).json(resulsts)
    }
    else {
        return res.status(400).json({
            message: 'query is required'
        })
    }
})

app.listen(PORT, () => console.log(`App runing at port ${PORT}`))
