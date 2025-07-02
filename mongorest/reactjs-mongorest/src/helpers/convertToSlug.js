export function convertToSlug(text) {
  if (!text) return '';
  text = text?.trim();
  text = text?.normalize('NFD').replace(/[\u0300-\u036F]/g, '');
  text = text?.toLowerCase();
  text = text?.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  text = text?.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  text = text?.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  text = text?.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  text = text?.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  text = text?.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  text = text?.replace(/đ/g, 'd');
  text = text?.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  text = text?.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
  text = text?.replace(/[^\w ]/gi, '');
  text = text?.replace(/ /g, '-');
  text = text?.replace(/[/]/g, '');
  text = text?.replace(/'/g, '');
  text = text?.replace(/^-+/, '');
  return text?.replace(/(-)\1+/g, '$1');
}
