import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles({
  cardEnumOption: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '.5em',
    alignItems: 'center',
    '& input': {width: '80%', marginRight: '1em', marginBottom: 0},
  },
});
