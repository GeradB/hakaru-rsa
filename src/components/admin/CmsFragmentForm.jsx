import { getAtPath, setAtPath } from '../../lib/cmsPath';
import { CMS_FORM_SECTIONS } from '../../lib/cmsFormSchema';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-rsa-gold focus:outline-none focus:ring-2 focus:ring-rsa-gold/35';

const btnSecondary =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold/40';

const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400';

function FieldLabel({ htmlFor, children, hint }) {
  return (
    <div className="mb-1">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-rsa-navy">
        {children}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function TextInput({ id, value, onChange, rows = 3 }) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`${inputClass} min-h-[4.5rem]`}
    />
  );
}

function ImageField({
  id,
  label,
  hint,
  value,
  onChange,
  uploading,
  onUploadFile,
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          id={id}
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className={`${inputClass} flex-1`}
        />
        <label className={`${btnSecondary} cursor-pointer shrink-0`}>
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onUploadFile(file, onChange);
            }}
          />
        </label>
        {value ? (
          <button type="button" className={btnDanger} onClick={() => onChange('')}>
            Clear
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
          <img
            src={value}
            alt=""
            className="max-h-40 w-auto max-w-full rounded object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

function StringArrayEditor({
  id,
  label,
  hint,
  value,
  onChange,
  itemLabel = 'Item',
  newItem,
}) {
  const list = Array.isArray(value) ? value : [];
  const makeNew = newItem || (() => '');

  return (
    <div>
      <FieldLabel htmlFor={`${id}-0`} hint={hint}>
        {label}
      </FieldLabel>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={`${id}-${index}`} className="flex gap-2">
            <input
              id={`${id}-${index}`}
              type="text"
              value={item ?? ''}
              onChange={(e) => {
                const next = [...list];
                next[index] = e.target.value;
                onChange(next);
              }}
              className={inputClass}
              aria-label={`${itemLabel} ${index + 1}`}
            />
            <button
              type="button"
              className={btnDanger}
              onClick={() => onChange(list.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${btnSecondary} mt-2`}
        onClick={() => onChange([...list, makeNew()])}
      >
        Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function ObjectArrayEditor({
  path,
  label,
  hint,
  value,
  onChange,
  itemLabel = 'Item',
  itemFields,
  newItem,
  uploading,
  onUploadFile,
}) {
  const list = Array.isArray(value) ? value : [];
  const makeNew = newItem || (() => ({}));

  const updateItem = (index, key, fieldValue) => {
    const next = list.map((row, i) =>
      i === index ? { ...row, [key]: fieldValue } : row,
    );
    onChange(next);
  };

  const moveItem = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    onChange(next);
  };

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="space-y-4">
        {list.map((row, index) => (
          <div
            key={`${path}-${index}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-rsa-navy">
                {itemLabel} {index + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={index === list.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {(itemFields || []).map((field) => {
                const fieldId = `${path}-${index}-${field.key}`;
                const fieldValue = row?.[field.key];
                if (field.type === 'textarea') {
                  return (
                    <div key={field.key}>
                      <FieldLabel htmlFor={fieldId} hint={field.hint}>
                        {field.label}
                      </FieldLabel>
                      <TextInput
                        id={fieldId}
                        value={fieldValue}
                        onChange={(v) => updateItem(index, field.key, v)}
                        rows={field.rows || 3}
                      />
                    </div>
                  );
                }
                if (field.type === 'image') {
                  return (
                    <ImageField
                      key={field.key}
                      id={fieldId}
                      label={field.label}
                      hint={field.hint}
                      value={fieldValue}
                      onChange={(v) => updateItem(index, field.key, v)}
                      uploading={uploading}
                      onUploadFile={onUploadFile}
                    />
                  );
                }
                if (field.type === 'stringArray') {
                  return (
                    <StringArrayEditor
                      key={field.key}
                      id={fieldId}
                      label={field.label}
                      hint={field.hint}
                      value={fieldValue}
                      onChange={(v) => updateItem(index, field.key, v)}
                      itemLabel="Benefit"
                      newItem={() => ''}
                    />
                  );
                }
                return (
                  <div key={field.key} className={field.width === 'sm' ? 'max-w-[8rem]' : ''}>
                    <FieldLabel htmlFor={fieldId} hint={field.hint}>
                      {field.label}
                    </FieldLabel>
                    <input
                      id={fieldId}
                      type="text"
                      value={fieldValue ?? ''}
                      onChange={(e) => updateItem(index, field.key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${btnSecondary} mt-3`}
        onClick={() => onChange([...list, makeNew()])}
      >
        Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function FieldEditor({ field, value, onChange, uploading, onUploadFile }) {
  const id = `cms-field-${field.path.replace(/\./g, '-')}`;

  if (field.type === 'textarea') {
    return (
      <div>
        <FieldLabel htmlFor={id} hint={field.hint}>
          {field.label}
        </FieldLabel>
        <TextInput
          id={id}
          value={value}
          onChange={onChange}
          rows={field.rows || 3}
        />
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <ImageField
        id={id}
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={onChange}
        uploading={uploading}
        onUploadFile={onUploadFile}
      />
    );
  }

  if (field.type === 'stringArray') {
    return (
      <StringArrayEditor
        id={id}
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={onChange}
        itemLabel={field.itemLabel || 'Item'}
        newItem={field.newItem}
      />
    );
  }

  if (field.type === 'objectArray') {
    return (
      <ObjectArrayEditor
        path={field.path}
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={onChange}
        itemLabel={field.itemLabel || 'Item'}
        itemFields={field.itemFields}
        newItem={field.newItem}
        uploading={uploading}
        onUploadFile={onUploadFile}
      />
    );
  }

  return (
    <div>
      <FieldLabel htmlFor={id} hint={field.hint}>
        {field.label}
      </FieldLabel>
      <input
        id={id}
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

/**
 * Form editor for a CMS slug fragment.
 * @param {{
 *   slug: string,
 *   value: object,
 *   onChange: (next: object) => void,
 *   uploading: boolean,
 *   onUploadFile: (file: File, setUrl: (url: string) => void) => void,
 * }} props
 */
export default function CmsFragmentForm({
  slug,
  value,
  onChange,
  uploading,
  onUploadFile,
}) {
  const sections = CMS_FORM_SECTIONS[slug] || [];

  if (!sections.length) {
    return (
      <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No form layout for this section yet — use Advanced JSON.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section
          key={section.section}
          className="rounded-2xl border border-white/15 bg-white/[0.97] p-5 shadow-xl md:p-6"
        >
          <h2 className="font-heading text-lg font-bold text-rsa-navy">{section.section}</h2>
          {section.hint ? (
            <p className="mt-1 text-sm text-gray-600">{section.hint}</p>
          ) : null}
          <div className="mt-4 grid gap-4">
            {section.fields.map((field) => (
              <FieldEditor
                key={field.path}
                field={field}
                value={getAtPath(value, field.path)}
                onChange={(nextFieldValue) =>
                  onChange(setAtPath(value, field.path, nextFieldValue))
                }
                uploading={uploading}
                onUploadFile={onUploadFile}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
