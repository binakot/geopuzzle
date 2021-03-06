from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from maps.models import Region


def region(request, id) -> JsonResponse:
    obj = get_object_or_404(Region, pk=id)
    return JsonResponse(obj.full_info(request.LANGUAGE_CODE))


def items(request, id) -> JsonResponse:
    obj = get_object_or_404(Region, pk=id)
    return JsonResponse(obj.items(request.LANGUAGE_CODE), safe=False)
