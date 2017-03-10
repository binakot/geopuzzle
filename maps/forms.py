import tempfile

from django import forms
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import MultiPolygon
from hvad.utils import load_translation

from maps.models import Country, Area


class KMLCountryImportForm(forms.Form):
    country = forms.ModelChoiceField(queryset=Country.objects.all(), disabled=True)
    kml = forms.FileField()
    language = forms.CharField()

    def save(self) -> None:
        with tempfile.NamedTemporaryFile(delete=True) as temp:
            temp.write(self.cleaned_data['kml'].read())
            temp.seek(0)
            source = DataSource(temp.name)
            for layer in source:
                for feat in layer:
                    polygon = feat.geom.geos if isinstance(feat.geom.geos, MultiPolygon) else MultiPolygon(feat.geom.geos)
                    area = Area.objects.create(name=feat['Name'].value, country=self.cleaned_data["country"],
                                               polygon=polygon, difficulty=2)
                    for lang, _ in settings.LANGUAGES:
                        trans = load_translation(area, lang, enforce=True)
                        trans.master = self
                        trans.name = feat['Name'].value
                        trans.save()
                    area.recalc_answer()


class KMLAreaImportForm(forms.Form):
    area = forms.ModelChoiceField(queryset=Area.objects.all(), disabled=True)
    kml = forms.FileField()

    def save(self) -> None:
        area = self.cleaned_data['area']
        with tempfile.NamedTemporaryFile(delete=True) as temp:
            temp.write(self.cleaned_data['kml'].read())
            temp.seek(0)
            source = DataSource(temp.name)
            for layer in source:
                for feat in layer:
                    area.polygon = feat.geom.geos if isinstance(feat.geom.geos, MultiPolygon) else MultiPolygon(feat.geom.geos)
                    area.recalc_answer()
                    area.save()
