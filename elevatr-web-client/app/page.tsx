import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { getVideos } from "./utilities/firebase/functions";

export default async function Home() {
  const videos = await getVideos();
  
  return (
      <main>
        {
          videos.map((video) => (
            // directs to watch page with a query param of v (video filename)
            <Link href={`/watch?v=${video.filename}`} key={video.id}>
              <Image src={'/thumbnail.png'} alt='video' width={120} height={80} className={styles.thumbnail} />
            </Link>
          ))
        }
      </main>
  );
}

export const revalidate = 30;