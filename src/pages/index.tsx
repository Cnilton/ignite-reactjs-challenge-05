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
        const formattedData = postFormatter(data);

        setPosts([...posts, ...formattedData.results]);
        setNextPage(formattedData.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        {/* <Header /> */}
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

  const postsPagination = postFormatter(response);

  return {
    props: {
      postsPagination,
    },
  };
};
