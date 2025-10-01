const Logo = ({ width = '32px', height = '32px' }) => { //32px por defecto*
  return (
    <img 
      src="/logo.svg" 
      alt="FoodApp Logo"
      style={{ width: width, height: height, backgroundColor: 'white', borderRadius: '50%'}} 
    />
  );
};

export default Logo;