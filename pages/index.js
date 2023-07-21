import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [coding, setCoding] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    setResult("Loading...");
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coding, description }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Unit tests generator</h3>
        <form onSubmit={onSubmit}>
          <textarea
            type="text"
            name="coding"
            rows="8"
            cols="100"
            placeholder="Enter your code"
            value={coding}
            onChange={(e) => setCoding(e.target.value)}
          />
          <br />
          <textarea
            type="text"
            name="description"
            rows="8"
            cols="100"
            placeholder="Enter your explaination about code"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <br />
          <input type="submit" value="Generate" />
        </form>
        <pre style={{ width: "80%" }}>{result}</pre>
      </main>
    </div>
  );
}
