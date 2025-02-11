
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

