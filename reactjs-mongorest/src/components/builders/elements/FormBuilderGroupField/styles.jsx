import { createUseStyles } from 'react-jss';

export const useStyles = createUseStyles({
  formBuilder: {
    display: 'block',
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
    '& .fa-plus-square': {
      color: 'green',
      'font-size': '1.5em',
      margin: '0 auto',
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
    '& .card-container': {
      '&:hover': {
        border: '1px solid green',
      },
      display: 'block',
      width: '100%',
      'min-width': '400px',
      margin: '0',
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
    '& .card-dependent': {
      border: '1px dashed gray',
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
      margin: '11px',
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
    '& .alert': {
      textAlign: 'left',
      width: '70%',
      margin: '1em auto',
      '& h5': {
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '0',
      },
      '& .fa': { fontSize: '14px' },
    },
    '& .disabled-unchecked-checkbox': {
      color: 'var(--gray)',
      '& div::before': { backgroundColor: 'var(--light-gray)' },
    },
    '& .disabled-input': {
      '& input': { backgroundColor: 'var(--light-gray)' },
      '& input:focus': {
        backgroundColor: 'var(--light-gray)',
        border: '1px solid var(--gray)',
      },
    },
  },
  formHead: {
    display: 'grid',
    margin: '0',
    padding: '5px 10px 0px 5px',
    'text-align': 'left',
    '& div': {
      display: 'inline-block',
      'text-align': 'left',
      padding: '5px 10px 0px 5px',
    },
    '& .form-title': {
      'text-align': 'left',
      borderRadius: '5.625px',
    },
    '& .form-description': {
      'text-align': 'left',
      height: '150px',
      borderRadius: '5.625px',
    },
    '& h5': {
      'font-size': '14px',
      'line-height': '21px',
      'font-weight': 'bold',
    },
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    '& .fa-pencil-alt': {
      border: '1px solid #1d71ad',
      color: '#1d71ad',
    },
    '& .modal-body': {
      maxHeight: '500px',
      overflowY: 'scroll',
    },
    '& .card-container': {
      width: '100%',
      minWidth: '400px',
      margin: '0',
      border: '1px solid var(--gray)',
      borderRadius: '4px',
      backgroundColor: 'white',
      '& h4': {
        width: '100%',
        textAlign: ['left', 'left'],
        display: 'inline-block',
        color: '#138ac2',
        margin: '0.25em 0.5em 0 0.5em',
        fontSize: '18px',
      },
      '& .d-flex': { borderBottom: '1px solid var(--gray)' },
      '& .label': { cssFloat: 'left' },
    },
    '& .card-container:hover': { border: '1px solid var(--green)' },
    '& .card-dependent': { border: '1px dashed var(--gray)' },
    '& .card-add': {
      cursor: 'pointer',
      display: 'block',
      color: '$green',
      fontSize: '1.5em',
    },
    '& .section-container': {
      width: '100%',
      minWidth: '400px',
      margin: '11px',
      border: '1px solid var(--gray)',
      borderRadius: '4px',
      '& h4': {
        width: '100%',
        textAlign: ['left', 'left'],
        display: 'inline-block',
        color: '#138ac2',
        margin: '0.25em 0.5em 0 0.5em',
        fontSize: '18px',
      },
      '& .d-flex': { borderBottom: '1px solid var(--gray)' },
      '& .label': { cssFloat: 'left' },
    },
    '& .section-container:hover': { border: '1px solid var(--green)' },
    '& .section-dependent': { border: '1px dashed var(--gray)' },
    '& .section-requirements': { border: '1px dashed black' },
  },
  formFooter: {
    marginTop: '1em',
    textAlign: 'center',
    '& .fa': { cursor: 'pointer', color: '$green', fontSize: '1.5em' },
  },
  error: {
    color: '#E63757',
  },
});
