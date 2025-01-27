import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Layout from 'containers/common/Layout';
import TextInput from 'components/TextInput';
import Button from 'components/Button';
import { useController } from 'hooks/index';

import styles from './ImportPhrase.scss';

interface IImportPhrase {
  onRegister: () => void;
}

const ImportPhrase: FC<IImportPhrase> = ({ onRegister }) => {
  const controller = useController();
  const { handleSubmit, register } = useForm({
    validationSchema: yup.object().shape({
      phrase: yup.string().required(),
    }),
  });
  const [isValid, setIsValid] = useState<boolean>(true);

  const onSubmit = (data: any) => {
    if (controller.wallet.importPhrase(data.phrase)) {
      onRegister();
    } else {
      setIsValid(false);
    }
  };

  return (
    <Layout title="Let's import your wallet" linkTo="/app.html" importSeed={true}>
      <form className={styles.importForm} onSubmit={handleSubmit(onSubmit)}>
        <span>Paste your wallet seed phrase below:</span>
        <TextInput
          type="text"
          name="phrase"
          visiblePassword
          multiline
          fullWidth
          inputRef={register}
          variant={styles.input}
        />

        {!isValid && <span>Seed phrase is not valid.</span>}

        <span>
          Importing your wallet seed will automatically import a wallet
          associated with this seed phrase.
        </span>

        <div className={styles.actions}>
          <Button
            type="submit"
            theme="btn-gradient-primary"
            variant={styles.button}
          >
            Import
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default ImportPhrase;
