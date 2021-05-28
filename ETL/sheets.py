#!/usr/bin/python3
from __future__ import print_function
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


def conexionSheets(token, credenciales, NOMBRESERVICIO="sheets", VERSIONSERVICIO="v4", PERMISOS=["https://www.googleapis.com/auth/spreadsheets.readonly"]):
    creds = None
    if os.path.exists(token):
        creds = Credentials.from_authorized_user_file(token, PERMISOS)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                credenciales, PERMISOS)
            creds = flow.run_local_server(port=8080)

        with open(token, 'w') as token:
            token.write(creds.to_json())
    return build(NOMBRESERVICIO, VERSIONSERVICIO, credentials=creds)
