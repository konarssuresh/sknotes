import {
  PWA_MIGRATION_EPOCH,
  PWA_MIGRATION_EPOCH_KEY,
  SW_MIGRATE_RELOAD_KEY,
  SW_VERSION_STORAGE_KEY,
} from "@/lib/pwa/sw-session-keys";

/**
 * Runs in <head> before module scripts so stale SW caches cannot load broken chunks.
 */
export function getPwaVersionSyncInlineScript() {
  return `(function(){try{
    var meta=document.querySelector('meta[name="sknotes-sw-version"]');
    var v=meta&&meta.getAttribute('content');
    if(!v)return;
    var versionKey="${SW_VERSION_STORAGE_KEY}";
    var reloadKey="${SW_MIGRATE_RELOAD_KEY}";
    var epochKey="${PWA_MIGRATION_EPOCH_KEY}";
    var epoch="${PWA_MIGRATION_EPOCH}";
    var prev=localStorage.getItem(versionKey);
    var needsEpoch=localStorage.getItem(epochKey)!==epoch;
    if(prev===v&&!needsEpoch)return;
    localStorage.setItem(versionKey,v);
    localStorage.setItem(epochKey,epoch);
    var hadController=('serviceWorker' in navigator)&&!!navigator.serviceWorker.controller;
    var migrated=needsEpoch||(prev!=null&&prev!==v);
    var finish=function(){
      if(!hadController&&!migrated)return;
      if(sessionStorage.getItem(reloadKey)==='1')return;
      sessionStorage.setItem(reloadKey,'1');
      location.reload();
    };
    if(!('caches' in window)){
      finish();
      return;
    }
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(name){return caches.delete(name);}));
    }).then(function(){
      if(!('serviceWorker' in navigator))return;
      return navigator.serviceWorker.getRegistrations().then(function(regs){
        return Promise.all(regs.map(function(r){return r.unregister();}));
      });
    }).then(finish).catch(finish);
  }catch(e){}})();`;
}
