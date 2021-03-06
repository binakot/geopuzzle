from django.conf import settings
from django.forms import Media
from django.template.defaultfilters import safe
from floppyforms.gis import MultiPolygonWidget as BaseMultiPolygonWidget, BaseGMapWidget, MultiPointWidget as BaseMultiPointWidget
from sorl.thumbnail import get_thumbnail
from sorl.thumbnail.admin.current import AdminImageWidget as SorlImageWidget


class AdminImageWidget(SorlImageWidget):
    def render(self, name, value, attrs=None, **kwargs) -> str:
        try:
            result = super(AdminImageWidget, self).render(name, value, attrs, **kwargs)
        except TypeError:
            result = 'Original image does not exists'
        return result


class ImageMixin(object):
    image_field = 'image'

    def image_tag(self, obj) -> str:
        return self.base_image_tag(obj)

    image_tag.short_description = 'Image'
    image_tag.allow_tags = True

    @classmethod
    def base_image_tag(cls, obj) -> str:
        image = getattr(obj, cls.image_field)
        url = settings.THUMBNAIL_DUMMY_SOURCE.format(width=80)
        try:
            thumb = get_thumbnail(image, 'x80', upscale=False, format='PNG')
            url = thumb.url
        except Exception as e:
            print(e)
        return safe('<img src="{}"/>'.format(url))


class MultiPolygonWidget(BaseMultiPolygonWidget, BaseGMapWidget):
    google_maps_api_key = settings.GOOGLE_KEY

    @property
    def media(self):
        return super(MultiPolygonWidget, self).media + Media(js=('gis/MapBoxExtend.js', ))


class MultiPointWidget(BaseMultiPointWidget, BaseGMapWidget):
    google_maps_api_key = settings.GOOGLE_KEY
