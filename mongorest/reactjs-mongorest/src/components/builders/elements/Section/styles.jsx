import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles({
  sectionContainer: {
    '& .section-head': {
      display: 'flex',
      borderBottom: '1px solid var(--gray)',
      margin: '0.5em 1.5em 0 1.5em',
      '& h5': {
        color: 'black',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      '& .section-entry': {
        width: '33%',
        textAlign: 'left',
        padding: '0.5em',
      },
      '& .section-reference': {width: '100%'},
    },
    '& .section-footer': {
      marginTop: '1em',
      textAlign: 'center',
      '& .fa': {cursor: 'pointer'},
    },
    '& .section-interactions': {
      margin: '0.5em 1.5em',
      textAlign: 'left',
      borderTop: '1px solid var(--gray)',
      paddingTop: '1em',
      '& .fa': {
        marginRight: '1em',
        borderRadius: '4px',
        padding: '0.25em',
        height: '25px',
        width: '25px',
      },
      '& .fa-pencil-alt, & .fa-arrow-up, & .fa-arrow-down': {
        border: '1px solid #1d71ad',
        color: '#1d71ad',
      },
      '& .fa-trash': {border: '1px solid #de5354', color: '#de5354'},
      '& .fa-arrow-up, & .fa-arrow-down': {marginRight: '0.5em'},
      '& .fb-checkbox': {
        display: 'inline-block',
        label: {color: '#9aa4ab'},
      },
      '& .interactions-left, & .interactions-right': {
        display: 'inline-block',
        width: '48%',
        margin: '0 auto',
      },
      '& .interactions-left': {textAlign: 'left'},
      '& .interactions-right': {textAlign: 'right'},
    },
  },
});
