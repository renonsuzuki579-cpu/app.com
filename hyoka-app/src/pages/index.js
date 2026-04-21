import Head from "next/head";
import HyokaApp from "@/components/HyokaApp";

export default function Home() {
  return (
    <>
      <Head>
        <title>他人評価アプリ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="みんなから評価されるドキドキ体験" />
      </Head>
      <HyokaApp />
    </>
  );
}
