from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from django.urls import include

from puzzle.views import WorkshopView, questions, puzzle, PuzzleEditView, WorkshopItems

workshop = [
    url(r'^$', WorkshopView.as_view(), name='workshop'),
    url(r'^items/$', WorkshopItems.as_view(), name='workshop_items'),
]

urlpatterns = [
    url(r'^(?P<name>[a-zA-Z0-9_]+)/questions/$', questions, name='puzzle_questions'),
    url(r'^workshop/', include(workshop)),
    url(r'^(?P<name>[a-zA-Z0-9_]+)/$', puzzle, name='puzzle_map'),
    url(r'^(?P<name>[a-zA-Z0-9_]+)/edit/$', login_required(PuzzleEditView.as_view()), name='puzzle_edit'),
]
