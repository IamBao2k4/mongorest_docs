import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles({
  preDefinedGallery: {
    display: 'flex',
    flexDirection: 'column',
    'text-align': 'center',
    '& .fa': {
      cursor: 'pointer',
    },
    '& .fa-question-circle': {
      color: 'gray',
    },
    '& .fa-asterisk': {
      'font-size': '.9em',
      color: 'green',
    },
    '& .arrows': {
      float: 'right',
      '& .fa-arrow-up, & .fa-arrow-down': {
        'border-radius': '4px',
        padding: '.25em',
        margin: '0 .5em 0 0',
        border: '1px solid #1d71ad',
        color: '#1d71ad',
        height: '28px',
        width: '28px',
      },
    },
    '& .form_footer': {
      marginTop: '1em',
      textAlign: 'center',
      '& .fa': { cursor: 'pointer', color: '$green', fontSize: '1.5em' },
    },
    '& .fa-plus-square': {
      color: 'green',
      'font-size': '1.5em',
      margin: '0 auto',
    },
    '& .card-container': {
      '&:hover': {
        border: '1px solid green',
      },
      width: '70%',
      'min-width': '400px',
      margin: '2em auto',
      border: '1px solid gray',
      'border-radius': '4px',
      'background-color': 'white',
      '& h4': {
        width: '100%',
        'text-align': 'left',
        display: 'inline-block',
        color: '#138AC2',
        margin: '0.25em .5em 0 .5em',
        'font-size': '18px',
      },
      '& .d-flex': {
        'border-bottom': '1px solid gray',
      },
      '& .label': {
        float: 'left',
      },
    },
    '& .card-requirements': {
      border: '1px dashed black',
    },
    '& .section-container': {
      '&:hover': {
        border: '1px solid green',
      },
      display: 'block',
      width: '90%',
      'min-width': '400px',
      margin: '2em auto',
      border: '1px solid var(--gray)',
      'border-radius': '4px',
      'background-color': 'white',
      '& h4': {
        width: '100%',
        'text-align': 'left',
        display: 'inline-block',
        color: '#138AC2',
        margin: '0.25em .5em 0 .5em',
        'font-size': '18px',
      },
      '& .d-flex': {
        'border-bottom': '1px solid var(--gray)',
      },
      '& .label': {
        float: 'left',
      },
    },
    '& .section-dependent': {
      border: '1px dashed gray',
    },
    '& .section-requirements': {
      border: '1px dashed black',
    },
    '& .fa-pencil-alt': {
      border: '1px solid #1d71ad',
      color: '#1d71ad',
    },
    '& .modal-body': {
      maxHeight: '500px',
      overflowY: 'scroll',
    },
    '& .card-container:hover': { border: '1px solid var(--green)' },
    '& .card-dependent': { border: '1px dashed var(--gray)' },
    '& .card-add': {
      cursor: 'pointer',
      display: 'block',
      color: '$green',
      fontSize: '1.5em',
    },

    '& .section-container:hover': { border: '1px solid var(--green)' },
  },
});
