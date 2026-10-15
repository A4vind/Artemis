import { Camera, ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useT } from '../i18n';
import { resizeImage, resizePhoto } from '../lib/device';
import { Avatar } from './KaamCard';
import { useToast } from './Toast';
import { Button } from './ui';

/** Hidden file input; on phones it offers the camera or gallery. */
function useFilePicker(onFile: (f: File) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const input = (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = ''; // allow choosing the same file again
        if (f) onFile(f);
      }}
    />
  );
  return { open: () => ref.current?.click(), input };
}

export function ProfilePhotoField({ name, photo, onChange }: { name: string; photo?: string; onChange: (p?: string) => void }) {
  const { t } = useT();
  const toast = useToast();
  const picker = useFilePicker(async (f) => {
    try {
      onChange(await resizePhoto(f));
    } catch {
      toast(t('edit.photoErr'), 'error');
    }
  });

  return (
    <div className="photo-field">
      <Avatar profile={{ name: name || '?', photo }} size="lg" />
      <div className="stack stack--sm">
        <span className="field__label">
          {t('edit.photo')} <span className="field__opt">· {t('common.optional')}</span>
        </span>
        <p className="field__hint">{t('edit.photoHint')}</p>
        <div className="btn-row">
          <Button variant="secondary" icon={Camera} onClick={picker.open}>
            {photo ? t('edit.changePhoto') : t('edit.addPhoto')}
          </Button>
          {photo && (
            <Button variant="quiet" onClick={() => onChange(undefined)}>
              {t('edit.removePhoto')}
            </Button>
          )}
        </div>
        {picker.input}
      </div>
    </div>
  );
}

export const MAX_WORK_PHOTOS = 4;

export function WorkPhotosField({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const picker = useFilePicker(async (f) => {
    setBusy(true);
    try {
      onChange([...photos, await resizeImage(f)].slice(0, MAX_WORK_PHOTOS));
    } catch {
      toast(t('edit.photoErr'), 'error');
    } finally {
      setBusy(false);
    }
  });

  return (
    <div className="field">
      <span className="field__label">
        {t('edit.workPhotos')} <span className="field__opt">· {t('common.optional')}</span>
      </span>
      <p className="field__hint">{t('edit.workPhotosHint', { n: MAX_WORK_PHOTOS })}</p>
      <ul className="work-photos work-photos--edit">
        {photos.map((src, i) => (
          <li key={i}>
            <img src={src} alt={t('edit.workPhotoAlt', { n: i + 1 })} />
            <button
              type="button"
              className="work-photos__remove"
              aria-label={t('edit.removeWorkPhoto', { n: i + 1 })}
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
            >
              <X aria-hidden size={16} />
            </button>
          </li>
        ))}
        {photos.length < MAX_WORK_PHOTOS && (
          <li>
            <button type="button" className="work-photos__add" onClick={picker.open} disabled={busy}>
              <ImagePlus aria-hidden size={26} />
              <span>{t('edit.addWorkPhoto')}</span>
            </button>
          </li>
        )}
      </ul>
      {picker.input}
    </div>
  );
}
