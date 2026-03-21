import api from './api';

const SUBSCRIPTION_PATH = 'subscriptions';

export const initiateSubscription = async (planType) => {
    const response = await api.post(`${SUBSCRIPTION_PATH}/initiate`, { planType });
    return response.data;
};

export const verifySubscription = async (pidx, subId) => {
    const response = await api.post(`${SUBSCRIPTION_PATH}/verify?sub_id=${subId}`, { pidx });
    return response.data;
};

export const getMySubscription = async () => {
    const response = await api.get(`${SUBSCRIPTION_PATH}/my-subscription`);
    return response.data;
};
