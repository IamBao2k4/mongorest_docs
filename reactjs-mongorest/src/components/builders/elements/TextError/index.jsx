const TextError = ({ text = '' }) => {
  if (!text) return <></>;
  return (
    <p
      style={{
        marginTop: '4px',
        color: '#EC0000',
        fontSize: '80%',
        fontWeight: 'bold',
      }}>
      {text}
    </p>
  );
};
export default TextError;
