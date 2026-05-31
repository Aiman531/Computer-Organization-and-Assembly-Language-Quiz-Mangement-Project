.model small
.stack 200h

.data

menu     db 13,10,"===== QUIZ GAME =====",13,10
         db "1. Start Game",13,10
         db "2. Exit",13,10
         db "Choose Option: $"

categoryMsg db 13,10,13,10,"Select Category",13,10
            db "1. General Knowledge",13,10
            db "2. Science",13,10
            db "3. History",13,10
            db "4. Sports",13,10
            db "5. Movies",13,10
            db "Choice: $"

userMsg   db 13,10,"Enter Username: $"
scoreMsg  db 13,10,"Your Score: $"
againMsg  db 13,10,13,10,"Play Again? (Y/N): $"
newline   db 13,10,"$"

score     db 0
ans       db ?

username     db 31 dup(0)
userLen      db 0
categoryName db 20 dup(0)

filename     db "RECORD.TXT",0
fileHandle   dw ?

gkText db "General Knowledge",0
scText db "Science",0
hsText db "History",0
spText db "Sports",0
mvText db "Movies",0

recordBuffer db 200 dup(' ')

txtUser  db "Username: ",0
txtCat   db " | Category: ",0
txtScore db " | Score: ",0
txtCRLF  db 13,10,0

gk1  db 13,10,"Q1. Capital of France?",13,10
     db "  A) London   B) Paris   C) Berlin",13,10
     db "Answer: $"
gk2  db 13,10,"Q2. Which is the Red Planet?",13,10
     db "  A) Venus   B) Mars   C) Jupiter",13,10
     db "Answer: $"

st1  db 13,10,"Q1. CPU stands for?",13,10
     db "  A) Central Processing Unit",13,10
     db "  B) Control Processing Unit",13,10
     db "  C) Central Program Utility",13,10
     db "Answer: $"
st2  db 13,10,"Q2. Chemical symbol of Gold?",13,10
     db "  A) Ag   B) Au   C) Go",13,10
     db "Answer: $"

hs1  db 13,10,"Q1. WW2 ended in which year?",13,10
     db "  A) 1945   B) 1943   C) 1948",13,10
     db "Answer: $"
hs2  db 13,10,"Q2. First US President?",13,10
     db "  A) Lincoln   B) George Washington   C) Jefferson",13,10
     db "Answer: $"

sp1  db 13,10,"Q1. 2018 FIFA World Cup winner?",13,10
     db "  A) Brazil   B) France   C) Germany",13,10
     db "Answer: $"
sp2q db 13,10,"Q2. Zero score in Tennis is called?",13,10
     db "  A) Love   B) Nil   C) Zero",13,10
     db "Answer: $"

mv1  db 13,10,"Q1. Who played Jack in Titanic?",13,10
     db "  A) Tom Cruise   B) Leonardo DiCaprio   C) Brad Pitt",13,10
     db "Answer: $"
mv2  db 13,10,"Q2. How many Harry Potter books are there?",13,10
     db "  A) 5   B) 7   C) 9",13,10
     db "Answer: $"

.code

;===========================================
; PROC: ASK
; Input: DX = offset of question string
; Output: ans = uppercase letter chosen
;===========================================
ASK proc near
    push ax
    push dx
    ; print question
    mov  ah, 9
    int  21h
    ; read key
    mov  ah, 1
    int  21h
    ; convert lowercase to uppercase
    cmp  al, 'a'
    jb   ASK_DONE
    cmp  al, 'z'
    ja   ASK_DONE
    sub  al, 32
ASK_DONE:
    mov  ans, al
    pop  dx
    pop  ax
    ret
ASK endp

;===========================================
; PROC: GETUSERNAME
; Reads username into 'username' buffer
; ES must equal DS before call
;===========================================
GETUSERNAME proc near
    push ax
    push cx
    push di
    mov  ah, 9
    mov  dx, offset userMsg
    int  21h
    lea  di, username
    xor  cx, cx
GU1:
    mov  ah, 1
    int  21h
    cmp  al, 13          ; Enter key
    je   GU2
    cmp  al, 8           ; Backspace
    jne  GU_STORE
    ; handle backspace
    cmp  cx, 0
    je   GU1
    dec  di
    dec  cx
    mov  ah, 2
    mov  dl, 8
    int  21h
    mov  dl, ' '
    int  21h
    mov  dl, 8
    int  21h
    jmp  GU1
GU_STORE:
    stosb
    inc  cx
    cmp  cx, 30
    jb   GU1
GU2:
    mov  al, 0
    stosb
    mov  userLen, cl
    pop  di
    pop  cx
    pop  ax
    ret
GETUSERNAME endp

;===========================================
; PROC: SETCATEGORY
; Input: SI = pointer to null-terminated category name
; ES must equal DS before call
;===========================================
SETCATEGORY proc near
    push ax
    push si
    push di
    lea  di, categoryName
SC_LOOP:
    lodsb
    stosb
    cmp  al, 0
    jne  SC_LOOP
    pop  di
    pop  si
    pop  ax
    ret
SETCATEGORY endp

;===========================================
; PROC: SAVE_RECORD
; Appends one line to RECORD.TXT:
;   Username: X | Category: Y | Score: Z
;===========================================
SAVE_RECORD proc near
    push ax
    push bx
    push cx
    push dx
    push si
    push di

    ; -- Try to open existing file for read/write --
    mov  ah, 3Dh
    mov  al, 2           ; read+write
    mov  dx, offset filename
    int  21h
    jnc  SR_OPENED

    ; -- File does not exist: create it --
    mov  ah, 3Ch
    xor  cx, cx
    mov  dx, offset filename
    int  21h
    jc   SR_DONE         ; creation failed, skip

SR_OPENED:
    mov  fileHandle, ax

    ; -- Seek to end of file --
    mov  ah, 42h
    mov  al, 2           ; from end
    mov  bx, fileHandle
    xor  cx, cx
    xor  dx, dx
    int  21h

    ; -- Build record string into recordBuffer --
    lea  di, recordBuffer

    ; copy "Username: "
    lea  si, txtUser
SR_U1:
    lodsb
    cmp  al, 0
    je   SR_U2
    stosb
    jmp  SR_U1
SR_U2:
    ; copy actual username
    lea  si, username
SR_UN1:
    lodsb
    cmp  al, 0
    je   SR_UN2
    stosb
    jmp  SR_UN1
SR_UN2:
    ; copy " | Category: "
    lea  si, txtCat
SR_C1:
    lodsb
    cmp  al, 0
    je   SR_C2
    stosb
    jmp  SR_C1
SR_C2:
    ; copy category name
    lea  si, categoryName
SR_CN1:
    lodsb
    cmp  al, 0
    je   SR_CN2
    stosb
    jmp  SR_CN1
SR_CN2:
    ; copy " | Score: "
    lea  si, txtScore
SR_S1:
    lodsb
    cmp  al, 0
    je   SR_S2
    stosb
    jmp  SR_S1
SR_S2:
    ; write score digit
    mov  al, score
    add  al, '0'
    stosb
    ; write CRLF
    mov  al, 13
    stosb
    mov  al, 10
    stosb

    ; -- Calculate length and write --
    mov  ax, di
    sub  ax, offset recordBuffer
    mov  cx, ax

    mov  ah, 40h
    mov  bx, fileHandle
    mov  dx, offset recordBuffer
    int  21h

    ; -- Close file --
    mov  ah, 3Eh
    mov  bx, fileHandle
    int  21h

SR_DONE:
    pop  di
    pop  si
    pop  dx
    pop  cx
    pop  bx
    pop  ax
    ret
SAVE_RECORD endp

;===========================================
; MAIN
;===========================================
main proc
    mov  ax, @data
    mov  ds, ax
    mov  es, ax          ; FIX: ES=DS so stosb/lodsb work correctly

START:
    mov  score, 0
    call GETUSERNAME

MENU1:
    mov  ah, 9
    mov  dx, offset menu
    int  21h
    mov  ah, 1
    int  21h
    cmp  al, '1'
    je   CATEGORY
    cmp  al, '2'
    jne  MENU1
    jmp  EXIT

CATEGORY:
    mov  ah, 9
    mov  dx, offset categoryMsg
    int  21h
    mov  ah, 1
    int  21h

    cmp  al, '1'
    jne  CAT2
    lea  si, gkText
    call SETCATEGORY
    jmp  GK
CAT2:
    cmp  al, '2'
    jne  CAT3
    lea  si, scText
    call SETCATEGORY
    jmp  SCIENCE
CAT3:
    cmp  al, '3'
    jne  CAT4
    lea  si, hsText
    call SETCATEGORY
    jmp  HISTORY
CAT4:
    cmp  al, '4'
    jne  CAT5
    lea  si, spText
    call SETCATEGORY
    jmp  SPORTS
CAT5:
    cmp  al, '5'
    jne  CATEGORY
    lea  si, mvText
    call SETCATEGORY
    jmp  MOVIES

;--- General Knowledge ---
GK:
    mov  dx, offset gk1
    call ASK
    cmp  ans, 'B'
    jne  GK_Q2
    inc  score
GK_Q2:
    mov  dx, offset gk2
    call ASK
    cmp  ans, 'B'
    je   GK_INC2
    jmp  SHOWSCORE
GK_INC2:
    inc  score
    jmp  SHOWSCORE

;--- Science ---
SCIENCE:
    mov  dx, offset st1
    call ASK
    cmp  ans, 'A'
    jne  SC_Q2
    inc  score
SC_Q2:
    mov  dx, offset st2
    call ASK
    cmp  ans, 'B'
    je   SC_INC2
    jmp  SHOWSCORE
SC_INC2:
    inc  score
    jmp  SHOWSCORE

;--- History ---
HISTORY:
    mov  dx, offset hs1
    call ASK
    cmp  ans, 'A'
    jne  HS_Q2
    inc  score
HS_Q2:
    mov  dx, offset hs2
    call ASK
    cmp  ans, 'B'
    je   HS_INC2
    jmp  SHOWSCORE
HS_INC2:
    inc  score
    jmp  SHOWSCORE

;--- Sports ---
SPORTS:
    mov  dx, offset sp1
    call ASK
    cmp  ans, 'B'
    jne  SP_Q2
    inc  score
SP_Q2:
    mov  dx, offset sp2q
    call ASK
    cmp  ans, 'A'
    je   SP_INC2
    jmp  SHOWSCORE
SP_INC2:
    inc  score
    jmp  SHOWSCORE

;--- Movies ---
MOVIES:
    mov  dx, offset mv1
    call ASK
    cmp  ans, 'B'
    jne  MV_Q2
    inc  score
MV_Q2:
    mov  dx, offset mv2
    call ASK
    cmp  ans, 'B'
    je   MV_INC2
    jmp  SHOWSCORE
MV_INC2:
    inc  score

;--- Show Score ---
SHOWSCORE:
    call SAVE_RECORD

    mov  ah, 9
    mov  dx, offset scoreMsg
    int  21h

    mov  dl, score
    add  dl, '0'
    mov  ah, 2
    int  21h

    mov  ah, 9
    mov  dx, offset againMsg
    int  21h

    mov  ah, 1
    int  21h

    cmp  al, 'Y'
    je   DO_AGAIN
    cmp  al, 'y'
    jne  EXIT
DO_AGAIN:
    jmp  START

EXIT:
    mov  ah, 4Ch
    int  21h

main endp
end main