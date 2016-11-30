import Preferences from 'discourse/controllers/preferences';
import RouteTopic from 'discourse/routes/topic';
import {withPluginApi} from 'discourse/lib/plugin-api';

function playMedia(evt) {

  const { controller } = evt;
  const { currentUser, siteSettings } = controller;
  if (currentUser) {
    const userEnabled = currentUser.get('custom_fields.autoplay_first_media');
    if (!userEnabled || currentUser.get('trust_level') < siteSettings.autoplay_required_trust_level) {
      return;
    }

    const observer = new MutationObserver(function () {
      const firstPost = $('#post_1');
      if (firstPost.length > 0) {
        observer.disconnect();

        const videos = firstPost.find('.ytp-large-play-button');
        if (videos.length > 0) {
          videos.first().trigger('click');
        } else {
          const audios = firstPost.find('audio');
          if (audios.length > 0) {
            audios[0].play();
          }
        }
      }
    });

    observer.observe(document, {subtree: true, childList: true, attributes: false});
  }
}

export default {
  name: 'autoplay-media',
  initialize() {
    withPluginApi('0.1', api => {
      const siteSettings = api.container.lookup('site-settings:main');
      if (siteSettings.autoplay_enabled) {
        RouteTopic.on('setupTopicController', playMedia);
      }
    });
  }
}
