import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';
import Posts from '../components/Posts';
import Header from '../components/Header';
import { postFormatter } from '../utils/dataFormatter';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        console.log(data.results.length);
        data.results.map(result => {
          result.first_publication_date = format(
            new Date(result.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          );
          return result;
        });

        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <Header />
        <section>
          <Posts posts={posts ?? []} />
          {nextPage && (
            <button type="button" onClick={loadMorePosts}>
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const posts: Post[] = response?.results?.map((post: Post) => {
    return {
      uid: post?.uid,
      data: {
        title: post?.data.title,
        subtitle: post?.data?.subtitle,
        // post?.data?.subtitle.find(content => content.type === 'paragraph')
        //   ?.text ?? '',
        author: post?.data.author,
      },

      first_publication_date: post?.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: { results: posts, next_page: response.next_page },
    },
  };
};
