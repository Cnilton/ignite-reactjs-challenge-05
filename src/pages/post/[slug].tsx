import { ptBR } from 'date-fns/locale';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO

  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  function calcTime(): number {
    let readingTime = 0;
    post.data.content.forEach(topic => {
      readingTime += topic.heading?.split(' ')?.length;
      topic.body.forEach(paragraph => {
        readingTime += paragraph.text?.split(' ')?.length;
      });
    });
    return Math.round(readingTime / 200);
  }

  return (
    <div className={styles.container}>
      <img src={post.data.banner.url} alt="logo" />
      <main>
        <header>
          <h1>{post.data.title}</h1>
          <section>
            <img src="/images/calendar.png" alt="Calendar" />
            <time>{post.first_publication_date}</time>
            <img src="/images/user.png" alt="User" />
            <span>{post.data.author}</span>
            <img src="/images/clock.png" alt="Clock" />
            <span>{calcTime()} min</span>
          </section>
        </header>
        {post.data.content.map(topic => {
          return (
            <section key={topic.heading} className={styles.content}>
              <h2>{topic.heading}</h2>
              {topic.body.map(paragraph => {
                return <p key={paragraph.text}>{paragraph.text}</p>;
              })}
            </section>
          );
        })}
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content.map(({ heading, body }) => {
        return {
          heading,
          body,
        };
      }),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 30,
  };
};
