const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios=require("axios")
const cheerio=require("cheerio")
const cors=require('cors')


import { config } from 'dotenv';

// Load environment variables from .env
config();
app.use(bodyParser.urlencoded({ extended: false }))
const cache = new NodeCache();
// parse application/json
app.use(bodyParser.json())

const corsOpts = {
    // origin: ["http://localhost:3000"],
    origin: ["http://filmyindia.kesug.com"],
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
  
  app.use(cors(corsOpts));
  // $('.artist-mv').each(async (index, element) => {
  //   const title = $(element).find('a').attr('title');
  //   const link = $(element).find('a').attr('href');
  //   const imageUrl = $(element).find('img').attr('src');

  //   // Store the data in an array or perform any other processing
  //   movieData.push({ title, link,imageUrl });
  // }
  
app.get("/top_trend_movie", async (req, res) => {
  // Check if the data is already in the cache
  if (cache.topTrend) {
    res.json({ movies: cache.topTrend });
  } else {
    try {
      const response = await axios.get(`https://filmyfly.art/`);
      const $ = cheerio.load(response.data);
      const movies = [];

      $('.container').each((index, element) => {
        const container = $(element);
        const image = container.find('img');
        const title = image.attr('alt');
        const buttonLink = container.find('a').attr('href');

        movies.push({
          title,
          imageSrc: image.attr('src'),
          buttonLink,
        });
      });

      // Cache the data for future requests
      cache.topTrend = movies;

      res.json({ movies: movies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});
// app.get("/top_trend_movie", async (req, res) => {
//  try {
//  const response = await axios.get(`https://filmyfly.art/`);
//  const $ = cheerio.load(response.data);
// const movies = [];
// // Select all the container elements and iterate through them
// $('.container').each((index, element) => {
//   const container = $(element);

//   // Find the image element inside the container
//   const image = container.find('img');

//   // Find the title (text inside the 'alt' attribute of the image)
//   const title = image.attr('alt');

//   // Find the button link
//   const buttonLink = container.find('a').attr('href');
//   const movieData = [];


//   // Push the scraped data into the movies array
//   movies.push({
//     title,
//     imageSrc: image.attr('src'),
//     buttonLink,
//   });
// });
// res.json({ movies:movies });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });
app.get("/detail_movie/:number/:name", async (req, res) => {
  try {
    const cacheKey = `movieDetail:${req.params.number}:${req.params.name}`;

    // Check if the data is already cached
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit");
      return res.json(cachedData);
    }

    const response = await axios.get(`https://filmyfly.art/page-download/${req.params.number}/${req.params.name}`);
    const $ = cheerio.load(response.data);

    const movies = [];
    const name = $('span:contains("Name:")').parent().text().replace('Name:', '').trim();
  const genre = $('span:contains("Genre:")').parent().text().replace('Genre:', '').trim();
  const duration = $('span:contains("Duration:")').parent().text().replace('Duration:', '').trim();
  const releaseDate = $('span:contains("Release Date:")').parent().text().replace('Release Date:', '').trim();
  const language = $('span:contains("Language:")').parent().text().replace('Language:', '').trim();
  const starcast = $('span:contains("Starcast:")').parent().text().replace('Starcast:', '').trim();
  const quality = $('span:contains("Quality:")').parent().text().replace('Quality:', '').trim();
  const fileSize = $('span:contains("File Size:")').parent().text().replace('File Size:', '').trim();
  const description = $('span:contains("Description:")').parent().text().replace('Description:', '').trim();
  const downloadLink = $('.dlbtn a').attr('href');
  const downloadLinka = $('.desc > a').attr('href');
  
  // Display the extracted information
  
     // Push the scraped data into the movies array
     movies.push({
      Name:name,
      Genre: genre,
      Duration:duration,
      Release_Date: releaseDate,
      Language:language,
      Starcast:starcast,
      Quality:quality,
      File_Size:fileSize,
      Description:description,
      downloadLink:downloadLink || downloadLinka
     });

    // Cache the movie details for future requests with a TTL (time-to-live) of 1 hour (3600 seconds)
    cache.set(cacheKey, { movies }, 3600);

    res.json({ movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});
// app.get("/detail_movie/:number/:name", async (req, res) => {
//   try {
//   const response = await axios.get(`https://filmyfly.art/page-download/${req.params.number}/${req.params.name}`);
//   const $ = cheerio.load(response.data);
      
//   const movies = [];
//   const name = $('span:contains("Name:")').parent().text().replace('Name:', '').trim();
// const genre = $('span:contains("Genre:")').parent().text().replace('Genre:', '').trim();
// const duration = $('span:contains("Duration:")').parent().text().replace('Duration:', '').trim();
// const releaseDate = $('span:contains("Release Date:")').parent().text().replace('Release Date:', '').trim();
// const language = $('span:contains("Language:")').parent().text().replace('Language:', '').trim();
// const starcast = $('span:contains("Starcast:")').parent().text().replace('Starcast:', '').trim();
// const quality = $('span:contains("Quality:")').parent().text().replace('Quality:', '').trim();
// const fileSize = $('span:contains("File Size:")').parent().text().replace('File Size:', '').trim();
// const description = $('span:contains("Description:")').parent().text().replace('Description:', '').trim();
// const downloadLink = $('.dlbtn a').attr('href');
// const downloadLinka = $('.desc > a').attr('href');

// // Display the extracted information

//    // Push the scraped data into the movies array
//    movies.push({
//     Name:name,
//     Genre: genre,
//     Duration:duration,
//     Release_Date: releaseDate,
//     Language:language,
//     Starcast:starcast,
//     Quality:quality,
//     File_Size:fileSize,
//     Description:description,
//     downloadLink:downloadLink || downloadLinka
//    });

//  res.json({ movies });
//    } catch (error) {
//      console.error(error);
//      res.status(500).json({ error: "An error occurred" });
//    }
//  });
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
const axiosInstance = axios.create({
  headers: {
    'User-Agent': userAgent,
  },
  
});

app.get("/downloadbyqulity/:name", async (req, res) => {
  try {
    const response = await axiosInstance.get(`http://linkmake.in/view/${req.params.name}`);
    const $ = cheerio.load(response.data);

    // Extract the movie title
    const movieTitle = $("head title").text().trim();

    // Initialize an array to store download links and their associated text
    const downloadLinks = [];

    // Find and iterate over all the download links
    $("div.dlink.dl").each((index, element) => {
      const linkElement = $(element);
      const linkText = linkElement.find("div.dll").text().trim();
      const linkUrl = linkElement.find("a").attr("href");

      // Add the download link details to the array
      downloadLinks.push({ text: linkText, url: linkUrl });
    });

    res.json({ movieTitle, downloadLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

 app.get("/latest_update_movie", async (req, res) => {
//  try {
//  const response = await axios.get(`https://filmyfly.art/`);
//  const $ = cheerio.load(response.data);
//  const movies = [];
 
//  $('.artist-mv tr').each((index, element) => {
//   const pageUrl = $(element).find('td a').attr('href');
//   const imageUrl = $(element).find('td a img').attr('src');
//   const movieTitle = $(element).find('td a').text();
//   const movieDescription = $(element).find('.fname').text();
  // Do something with the extracted information
//   movies.push({
//     pageUrl,
//     imageUrl,
//     movieTitle,
//     movieDescription
//   })
// });
//  const movieElements = $('.artist-mv');
// movieElements.each((index, element) => {
//     const movie = {};

//     // Get the movie title
//     movie.title = $(element).find('a').eq(1).text();

//     // Get the movie image URL
//     movie.image = $(element).find('img').attr('src');

//     // Get the button link
//     movie.buttonLink = $(element).find('a').eq(0).attr('href');

//     // Process or display information for the current movie
//     console.log(`Movie Title: ${movie.title}`);
//     console.log(`Image URL: ${movie.image}`);
//     console.log(`Button Link: ${movie.buttonLink}`);
//     console.log('---');
// });
  //  $('.artist-mv').each((index, element) => {
  //     const movie = {};

  //    element.each((index, element) => {
  //       const pageUrl = $(element).find('td a').attr('href');
  //       const imageUrl = $(element).find('td a img').attr('src');
  //       const movieTitle = $(element).find('td a').text();
  //       const movieDescription = $(element).find('.fname').text();

  //       // Do something with the extracted information
  //       console.log('Page URL:', pageUrl);
  //       console.log('Image URL:', imageUrl);
  //       console.log('Movie Title:', movieTitle);
  //       console.log('Movie Description:', movieDescription);
  //       console.log('---');
  //     });

  //     movies.push(movie);
  //   });
  
// res.json({ movies:movies });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }


if (cache.latestUpdate) {
  res.json({ movies: cache.latestUpdate });
} else {
  try {
    const response = await axios.get(`https://filmyfly.art/`);
    const $ = cheerio.load(response.data);
    const movies = [];

    $('.artist-mv tr').each((index, element) => {
      const pageUrl = $(element).find('td a').attr('href');
      const imageUrl = $(element).find('td a img').attr('src');
      const movieTitle = $(element).find('td a').text();
      const movieDescription = $(element).find('.fname').text();

      movies.push({
        pageUrl,
        imageUrl,
        movieTitle,
        movieDescription
      });
    });

    // Cache the data for future requests
    cache.latestUpdate = movies;

    res.json({ movies: movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
});
app.get("/search_movie/:name", async (req, res) => {
   const searchTerm = req.params.name;

  // Check if the data is already in the cache
  if (cache[searchTerm]) {
    res.json({ movies: cache[searchTerm] });
  } else {
    try {
      const response = await axios.get(`https://filmyfly.art/site-search.html?to-search=${searchTerm}`);
      const $ = cheerio.load(response?.data);
      const movies = [];

      $('.artist-mv tr').each((index, element) => {
        const pageUrl = $(element).find('td a').attr('href');
        const imageUrl = $(element).find('td a img').attr('src');
        const movieTitle = $(element).find('td a').text();
        const movieDescription = $(element).find('.fname').text();

        movies.push({
          pageUrl,
          imageUrl,
          movieTitle,
          movieDescription
        });
      });

      // Cache the data for future requests
      cache[searchTerm] = movies;

      res.json({ movies: movies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  // try {
  // const response = await axios.get(`https://filmyfly.art/site-search.html?to-search=${req.params.name}`);
  // const $ = cheerio.load(response?.data);
  // const movies = [];
  
  // $('.artist-mv tr').each((index, element) => {
  //  const pageUrl = $(element).find('td a').attr('href');
  //  const imageUrl = $(element).find('td a img').attr('src');
  //  const movieTitle = $(element).find('td a').text();
  //  const movieDescription = $(element).find('.fname').text();
 
   // Do something with the extracted information
//    movies.push({
//      pageUrl ,
//      imageUrl,
//      movieTitle,
//      movieDescription
//    })
//  });
 //  const movieElements = $('.artist-mv');
 // movieElements.each((index, element) => {
 //     const movie = {};
 
 //     // Get the movie title
 //     movie.title = $(element).find('a').eq(1).text();
 
 //     // Get the movie image URL
 //     movie.image = $(element).find('img').attr('src');
 
 //     // Get the button link
 //     movie.buttonLink = $(element).find('a').eq(0).attr('href');
 
 //     // Process or display information for the current movie
 //     console.log(`Movie Title: ${movie.title}`);
 //     console.log(`Image URL: ${movie.image}`);
 //     console.log(`Button Link: ${movie.buttonLink}`);
 //     console.log('---');
 // });
   //  $('.artist-mv').each((index, element) => {
   //     const movie = {};
 
   //    element.each((index, element) => {
   //       const pageUrl = $(element).find('td a').attr('href');
   //       const imageUrl = $(element).find('td a img').attr('src');
   //       const movieTitle = $(element).find('td a').text();
   //       const movieDescription = $(element).find('.fname').text();
 
   //       // Do something with the extracted information
   //       console.log('Page URL:', pageUrl);
   //       console.log('Image URL:', imageUrl);
   //       console.log('Movie Title:', movieTitle);
   //       console.log('Movie Description:', movieDescription);
   //       console.log('---');
   //     });
 
   //     movies.push(movie);
   //   });
   
//  res.json({ movies:movies });
//    } catch (error) {
//      console.error(error);
//      res.status(500).json({ error: "An error occurred" });
//    }
 });
// app.listen(9000,()=>{
//     console.log("running",9000)
// });
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);