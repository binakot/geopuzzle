from typing import Dict

from django.utils.translation import ugettext as _

from django import forms
from django.core.handlers.wsgi import WSGIRequest
from django.db.models import QuerySet
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from maps.forms import AreaContainsForm
from maps.models import Country, Area, DIFFICULTY_LEVELS


class MapForm(forms.Form):
    id = forms.ModelMultipleChoiceField(queryset=Area.objects.all(), required=False)
    difficulty = forms.ChoiceField(choices=DIFFICULTY_LEVELS, required=False, initial=1)

    def __init__(self, country, lang, *args, **kwargs):
        self.country = get_object_or_404(Country, slug=country)
        self.lang = lang
        super(MapForm, self).__init__(*args, **kwargs)

    def areas(self) -> QuerySet:
        if len(self.cleaned_data['id']) > 0:
            return self.cleaned_data['id']

        queryset = Area.objects.language(self.lang).filter(country=self.country).exclude(difficulty=0).order_by('?')
        if self.cleaned_data['difficulty'] != '':
            queryset = queryset.filter(difficulty=int(self.cleaned_data['difficulty']))
        return queryset


def puzzle_area(area: Area) -> Dict:
    return {'success': True, 'infobox': area.strip_infobox, 'polygon': area.polygon_gmap}


@csrf_exempt
def giveup(request: WSGIRequest, name: str) -> JsonResponse:
    form = MapForm(data=request.GET, country=name, lang=request.LANGUAGE_CODE)
    if not form.is_valid():
        return JsonResponse(form.errors, status=400)
    result = {area.id: puzzle_area(area) for area in form.areas()}
    return JsonResponse(result)


@csrf_exempt
def check(request: WSGIRequest, pk: str) -> JsonResponse:
    area = get_object_or_404(Area, pk=pk)
    form = AreaContainsForm(data=request.POST, area=area)
    result = puzzle_area(area) if form.is_valid() else {'success': False}
    return JsonResponse(result)


def infobox_by_id(request: WSGIRequest, pk: str) -> HttpResponse:
    obj = get_object_or_404(Area, pk=pk)
    return JsonResponse(obj.strip_infobox)


def questions(request: WSGIRequest, name: str) -> JsonResponse:
    form = MapForm(data=request.GET, country=name, lang=request.LANGUAGE_CODE)
    if not form.is_valid():
        return JsonResponse(form.errors, status=400)
    result = [{
        'id': area.id,
        'name': area.name,
        'polygon': area.polygon_gmap,
        'center': area.polygon.centroid.coords,
        'default_position': area.country.pop_position()}
            for area in form.areas()]
    return JsonResponse(result, safe=False)


def maps(request: WSGIRequest, name: str) -> HttpResponse:
    country = get_object_or_404(Country, slug=name)
    context = {
        'language': request.LANGUAGE_CODE,
        'country': country,
        'text': _('{} was assembled! You time is ').format(country.name if country.id != 1 else _('World map'))
    }
    return render(request, 'maps/map.html', context=context)
