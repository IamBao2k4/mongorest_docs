'use client';

import { ENUM_TYPE_NAVIGATE_RELATION, ENUM_TYPE_TAG } from '@/data/enum';
import Link from 'next/link';
import { useParams } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import { useRelation } from '../../../context';
import { Tag as TagShadcn } from '@/components/ui/Tag';

const useStyles = createUseStyles({
  link: {
    color: '#327EE2',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 400,
    marginBottom: 0,
    textDecoration: 'underline',
  },
});

const Tag = ({ onClose = () => {}, title = '', disable = false, item, path }) => {
  const classes = useStyles();

  const { group, schema, typeRelation } = useRelation();
  const params = useParams();

  const navigateTag = () => {
    const keyPosttype = group[0]?.name || params.pid;

    if (schema?.navigateTo === ENUM_TYPE_NAVIGATE_RELATION.filter) {
      if (schema?.objectKey) {
        return {
          pathname: `/post/${keyPosttype}/posts`,
          query: { ['search' + '[' + schema?.objectKey + ':' + 'in' + ']']: item?.id },
        };
      }

      return null;
    } else {
      let pathname = '';
      if (typeRelation === ENUM_TYPE_TAG.post) pathname = `/post/${keyPosttype}/posts/${item?.id}`;
      else if (typeRelation === ENUM_TYPE_TAG.category)
        pathname = `/post/${keyPosttype}/categories/${item?.id}`;
      else pathname = `${path}/${item?.id}`;

      return { pathname };
    }
  };

  const titleTag = title;

  const component = navigateTag() ? (
    <Link href={navigateTag()}>
      <span className={classes.link}>{titleTag}</span>
    </Link>
  ) : (
    <span>{titleTag}</span>
  );

  if (disable) {
    return <TagShadcn>{component}</TagShadcn>;
  } else {
    return (
      <TagShadcn
        closable
        onClose={onClose}>
        {component}
      </TagShadcn>
    );
  }
};

export default Tag;
