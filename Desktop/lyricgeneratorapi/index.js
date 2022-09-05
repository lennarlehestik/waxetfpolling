import express from 'express'
import { Configuration, OpenAIApi } from "openai"
import cors from 'cors';
import Stripe from 'stripe';
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import bodyParser from 'body-parser'
const app = express()
const port = 8080
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));



const firebaseConfig = {
    apiKey: "AIzaSyBjhH-H1r_xMHNTSXRS2ANuBoIGfD6Fky4",
    authDomain: "lyricgenerator-15905.firebaseapp.com",
    projectId: "lyricgenerator-15905",
    storageBucket: "lyricgenerator-15905.appspot.com",
    messagingSenderId: "473078552024",
    appId: "1:473078552024:web:9531792cecc5e2f798cead"
  };

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(firebaseapp);

const stripe = new Stripe('sk_test_51LeityIvixTShlBidoqH3YaAN8i6hXLaYvHjrinkN0k5G3gqh0TPUP8dkvuiHFppUMs0B8WjQpdR9L6Gx3I3tw6h00gvsFJxbP');

const configuration = new Configuration({
    organization: "org-2SFh3jVLLpWLXUyCvUPXKmok",
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

app.get('/:uid/:prompt', async(req, res) => {
    const docRef = doc(db, "users", req.params.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
    console.log(docSnap.data());
    } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    }
    if(docSnap.data().tokens > 0){
    await updateDoc(docRef, {
        "tokens": docSnap.data().tokens - 1
    });
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: req.params.prompt,
        max_tokens:100
      });
      const result = completion.data.choices[0].text;
      console.log(result)
      res.json({result:result})
    }else{
        res.send("You don't have enough tokens")
    }
})

app.get('/signup/:email/:uid', async(req,res)=>{
    const docRef = doc(db, "users", req.params.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        try{
            await setDoc(doc(db, "users", req.params.uid), {
                email: req.params.email,
                tokens:5,
                uid:req.params.uid
              });
            } catch(e){
                console.log(e)
            }
    } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    }

    res.send("User added.")
})


app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Credit',
            },
            unit_amount: 10,
          },
          quantity: 50,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000',
      cancel_url: 'http://localhost:3000',
    })
    console.log(req.body.uid)
    const docRef = doc(db, "users", req.body.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
    console.log(docSnap.data());
    } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    }
    if(docSnap.data()){
    await updateDoc(docRef, {
        "tokens": docSnap.data().tokens + 10
    });
    }

  
    res.redirect(303, session.url);
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})