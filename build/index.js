import briskit from 'stack';
import { default as providers, setProvider } from 'providers';
briskit.providers = providers;
briskit.use = setProvider;
setProvider();
export default briskit;
