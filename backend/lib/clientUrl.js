const addProtocol = (url) => {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export const getClientUrl = () => {
  const configuredUrl = process.env.CLIENT_URL?.trim();
  const renderHostname = process.env.RENDER_EXTERNAL_HOSTNAME?.trim();
  const configuredIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    configuredUrl || '',
  );
  const preferredUrl =
    renderHostname && configuredIsLocal ? renderHostname : configuredUrl || renderHostname;
  const clientUrl =
    addProtocol(preferredUrl) || 'http://localhost:5173';
  return clientUrl.replace(/\/+$/, '');
};
