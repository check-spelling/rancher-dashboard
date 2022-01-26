import { parse as parseUrl, addParam } from '@/utils/url';
import { COUNT } from '@/config/types';

export function computeDashboardUrl(embedUrl, clusterId, params) {
  const url = parseUrl(embedUrl);
  const clusterPrefix = clusterId === 'local' ? '' : `/k8s/clusters/${ clusterId }`;

  let newUrl = `${ clusterPrefix }${ url.path }`;

  if (url.query.viewPanel) {
    newUrl = addParam(newUrl, 'viewPanel', url.query.viewPanel);
  }
  newUrl = addParam(newUrl, 'orgId', url.query.orgId);
  newUrl = addParam(newUrl, 'kiosk', null);

  Object.entries(params).forEach((entry) => {
    newUrl = addParam(newUrl, entry[0], entry[1]);
  });

  return newUrl;
}

export async function dashboardExists(dispatch, clusterId, embedUrl, store = 'cluster') {
  if (!await isMonitoringInstalled(dispatch, store)) {
    return false;
  }

  const url = parseUrl(embedUrl);
  const clusterPrefix = clusterId === 'local' ? '' : `/k8s/clusters/${ clusterId }`;
  const prefix = `${ clusterPrefix }/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-grafana:80/proxy/`;
  const delimiter = 'http:rancher-monitoring-grafana:80/proxy/';
  const path = url.path.split(delimiter)[1];
  const uid = path.split('/')[1];
  const newUrl = `${ prefix }api/dashboards/uid/${ uid }`;

  try {
    await dispatch(`${ store }/request`, { url: newUrl, redirectUnauthorized: false });

    return true;
  } catch (ex) {
    return false;
  }
}

export async function allDashboardsExist(dispatch, clusterId, embeddedUrls, store = 'cluster') {
  const existPromises = embeddedUrls.map(url => dashboardExists(dispatch, clusterId, url, store));

  return (await Promise.all(existPromises)).every(exists => exists);
}

export function queryGrafana(dispatch, clusterId, query, range, step) {
  const clusterPrefix = clusterId === 'local' ? '' : `/k8s/clusters/${ clusterId }`;
  const url = `${ clusterPrefix }/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-grafana:80/proxy/api/datasources/proxy/1/api/v1/query_range?query=${ query }&start=${ range.start }&end=${ range.end }&step=${ step }`;

  return dispatch('cluster/request', { url, redirectUnauthorized: false });
}

export async function hasLeader(dispatch, clusterId) {
  const end = Date.now() / 1000;
  const start = end - (5 * 60);

  const response = await queryGrafana(dispatch, clusterId, 'max(etcd_server_has_leader)', { start, end }, 30);

  return response.data.result[0]?.values?.[0]?.[1] === '1';
}

export async function leaderChanges(dispatch, clusterId) {
  const end = Date.now() / 1000;
  const start = end - (60 * 60);

  const response = await queryGrafana(dispatch, clusterId, 'max(etcd_server_leader_changes_seen_total)', { start, end }, 30);

  return response.data.result[0]?.values?.[0]?.[1] || 0;
}

export async function failedProposals(dispatch, clusterId) {
  const end = Date.now() / 1000;
  const start = end - (60 * 60);

  const response = await queryGrafana(dispatch, clusterId, 'sum(etcd_server_proposals_failed_total)', { start, end }, 30);

  return response.data.result[0]?.values?.[0]?.[1] || 0;
}

async function isMonitoringInstalled(dispatch, store = 'cluster') {
  const counts = await dispatch(`${ store }/findAll`, { type: COUNT });

  return !!counts?.[0]?.counts?.['catalog.cattle.io.app']?.namespaces?.['cattle-monitoring-system'];
}
