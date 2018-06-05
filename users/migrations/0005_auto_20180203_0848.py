# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-02-03 08:48
from __future__ import unicode_literals

from django.db import migrations, models

import users.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20171012_1920'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='image',
            field=users.fields.CustomAvatarField(null=True, upload_to='avatars', verbose_name='Avatar'),
        ),
        migrations.AlterField(
            model_name='user',
            name='language',
            field=models.CharField(choices=[('en', 'English'), ('ru', 'Russian')], default='en', max_length=2, verbose_name='Language'),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.CharField(blank=True, max_length=150, verbose_name='last name'),
        ),
    ]
