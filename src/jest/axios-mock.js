import axios from "axios";
import MockAdapter from "axios-mock-adapter";

process.env.REACT_APP_API_ENDPOINT = '/mockapi/';

export const axiosMock = new MockAdapter(axios);
