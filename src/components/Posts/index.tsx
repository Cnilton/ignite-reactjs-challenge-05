import Link from 'next/link';
import styles from './styles.module.scss';

interface PostItem {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostProps {
  posts: PostItem[];
}

function Posts({ posts }: PostProps): JSX.Element {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(postItem => (
            <Link key={postItem.uid} href={`/post/${postItem.uid}`}>
              <a>
                <strong>{postItem.data.title}</strong>
                <p>{postItem.data.subtitle}</p>
                <div>
                  <img src="/images/calendar.png" alt="Calendar Icon" />
                  <time>{postItem.first_publication_date}</time>

                  <img src="/images/user.png" alt="User Icon" />
                  <span>{postItem.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export default Posts;
